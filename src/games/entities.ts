import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, Index, OneToMany, ManyToOne } from 'typeorm'
import User from '../users/entity'
import Card from '../cards/entity'

// export type Symbol = 'x' | 'o'
// export type Row = [ Symbol | null, Symbol | null, Symbol | null ]
 //export type Cards = [null]
//const CardsDefault: Cards = [null]

type Status = 'pending' | 'started' | 'finished'
//type Location = 'Deck' | 'CurrentCard' | 'Player1Hand' | 'Player2Hand' | 'Player3Hand' | 'Player4Hand'
//type Color = 'yellow' | 'red' | 'green' | 'blue' | 'black'

// const emptyRow: Row = [null, null, null]
// const emptyBoard: Board = [ emptyRow, emptyRow, emptyRow ]


@Entity()
export class Game extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  // @Column()
  // cards: Cards

  @Column('text', { default: 'pending' })
  turn: String

  @Column('text', { default: 'pending' })
  winner: String

  @Column('text', {default: 'pending'})
  status: Status

  // this is a relation, read more about them here:
  // http://typeorm.io/#/many-to-one-one-to-many-relations
  @OneToMany(_ => Player, player => player.game, {eager:true})
  players: Player[]

  @OneToMany(_ => Card, card => card.game, { eager: true })
  cards: Card[]

  // This creates a Card class (import) and assigns it to a game
  generateCard(card) { return Card.create({ ...card, game: this }    )}
}

@Entity()
 // @Index(['game', 'user', 'symbol'], { unique: true })
@Index(['game', 'user'], {unique:true})
export class Player extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @ManyToOne(_ => User, user => user.players)
  user: User

  @ManyToOne(_ => Game, game => game.players)
  game: Game

  // Take out when setting up a new db
  // Put back in when creating games
  // @Column()
  // userId: number

  @Column()
  username: string    // Could be enum [player1,player2]

    // FS add:
  @OneToMany(_ => Card, card => card.player, { eager: true } )
    cards: Card[]
}
