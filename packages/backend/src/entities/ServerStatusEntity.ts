import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ServerEntity } from './ServerEntity';

@Entity('server_statuses')
export class ServerStatusEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = '';

  @Column({ type: 'uuid' })
  serverId: string = '';

  @ManyToOne(() => ServerEntity, server => server.statuses)
  @JoinColumn({ name: 'serverId' })
  server: ServerEntity = new ServerEntity();

  @Column()
  isOnline: boolean = false;

  @Column()
  playerCount: number = 0;

  @Column()
  maxPlayers: number = 0;

  @Column({ length: 255, nullable: true })
  motd: string = '';

  @Column({ length: 100, nullable: true })
  version: string = '';

  @CreateDateColumn()
  lastCheckedAt: Date = new Date();
}
