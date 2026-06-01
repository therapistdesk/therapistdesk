import { Entity, PrimaryGeneratedColumn } from 'typeorm';
// import { OneToMany } from 'typeorm';

@Entity()
export class Therapist {
  @PrimaryGeneratedColumn()
  id: number;
  
}
