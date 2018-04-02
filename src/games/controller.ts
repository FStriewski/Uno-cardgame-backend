import {
  JsonController, Authorized, CurrentUser, Post, Param, BadRequestError, HttpCode, NotFoundError, ForbiddenError, Get,
  Body, Patch,
} from 'routing-controllers'

import User from '../users/entity'
import { Game, Player } from './entities'
import Card from '../cards/entity'

import {cardData} from '../cards/cardData'

// import {IsBoard, isValidTransition, calculateWinner, finished} from './logic'
// import { Validate } from 'class-validator'
import {io} from '../index'


class GameUpdate {

  card: Card
}

@JsonController()
export default class GameController {



  //Player 1 creating a game
  @Authorized()
  @Post('/games')
  @HttpCode(201)
  async createGame(
    @CurrentUser() user: User
  ) {
    const entity = await Game.create().save()
    
    // CREATE PLAYER 1:
    const player = await Player.create({
      game: entity,
      user,
      username: "Player1",
    })
    await player.save()
    // ASSIGN 6 CARDS TO PLAYER 1:

    const cards = cardData
    const randomCardId = (cards) => {
      return Math.floor((Math.random() * cards.length) + 1);
    }

    for (let x = 1; x < 7; x++){
      let card = entity.generateCard(cards[randomCardId(cards)])
      card.location = player.username
      card.player = player
      await card.save()
    }

    // CREATE A DECK OF CARDS:
    for (let x = 1; x < 30; x++){
      let card = entity.generateCard(cards[randomCardId(cards)])
      card.location = "Deck"
      await card.save()
    }

    //CREATE CURRENT CARD:
    let card = entity.generateCard(cards[randomCardId(cards)])
    card.location = "CurrentCard"
    await card.save()


    const game = await Game.findOneById(entity.id)


    io.emit('action', {
      type: 'ADD_GAME',
      payload: game
    })

    return game
  }

    //Player 2 joining game
  @Authorized()
  @Post('/games/:id([0-9]+)/players')
  @HttpCode(201)
  async joinGame(
    @CurrentUser() user: User,
    @Param('id') gameId: number
  ) {
    const game = await Game.findOneById(gameId)
    if (!game) throw new BadRequestError(`Game does not exist`)
    if (game.status !== 'pending') throw new BadRequestError(`Game is already started`)

    game.status = 'started'
    await game.save()

    const player = await Player.create({
      game,
      user,
      username: "Player2"
    }).save()

    const cards = cardData
    const randomCardId = (cards) => {
      return Math.floor((Math.random() * cards.length) + 1);
    }

    for (let x = 1; x < 7; x++){
      let card = game.generateCard(cards[randomCardId(cards)])
      card.location = player.username
      card.player = player
      await card.save()
    }


    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: await Game.findOneById(game.id)
    })

    return player
  }


  //UPDATE CARD LOCATION:
  @Authorized()

@Patch('/games/:id([0-9]+)')
async playCardFromHand(
  @CurrentUser() user: User,
  @Param('id') gameId: number,
  @Body() update: Card
) {
  const game = await Game.findOneById(gameId)
  if (!game) throw new NotFoundError(`Game does not exist`)

  const player = await Player.findOne({ user, game })

  if (!player) throw new ForbiddenError(`You are not part of this game`)
  if (game.status !== 'started') throw new BadRequestError(`The game is not started yet`)

  //let currentCard = Card.find
  //let card = update
  if(update.location === player.username){
  update.location = "CurrentCard"
  await update.save()

  update.player = null

//  player.cards.filter(card => card.location === player.username)
  await update.save()

  await game.save()

  io.emit('action', {
    type: 'UPDATE_GAME',
    payload: game
  })

  return game

  }

    update.location = player.username
    update.player = player
    await update.save()
    //game.cards = 

    await game.save()

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: game
    })

    return game





}





  // @Authorized()

  // @Patch('/games/:id([0-9]+)')
  // async drawSingleCard(
  //   @CurrentUser() user: User,
  //   @Param('id') gameId: number,
  //   @Body() update: Card
  // ) {
  //   const game = await Game.findOneById(gameId)
  //   if (!game) throw new NotFoundError(`Game does not exist`)

  //   const player = await Player.findOne({ user, game })

  //   if (!player) throw new ForbiddenError(`You are not part of this game`)
  //   if (game.status !== 'started') throw new BadRequestError(`The game is not started yet`)

   
  //   //let card = update
  //   update.location = player.username
  //   update.player = player
  //   await update.save()
  //   //game.cards = 
    
  //   await game.save()

  //   io.emit('action', {
  //     type: 'DRAWSINGLE',
  //     payload: game
  //   })

  //   return game
  // }

  @Authorized()
  @Get('/games/:id([0-9]+)')
  getGame(
    @Param('id') id: number
  ) {
    return Game.findOneById(id)
  }

  @Authorized()
  @Get('/games')
  getGames() {
    return Game.find()
  }
}
