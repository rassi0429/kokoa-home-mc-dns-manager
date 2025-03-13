import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ServerStatusEntity } from './ServerStatusEntity';

@Entity('minecraft_servers')
export class ServerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = '';

  @Column({ length: 100 })
  name: string = '';

  @Column({ length: 255 })
  dnsRecord: string = '';

  @Column({ length: 255 })
  targetIp: string = '';

  @Column({ length: 255 })
  targetHostname: string = '';

  @Column()
  targetPort: number = 25565;

  @Column({ length: 255, nullable: true })
  cloudflareRecordId: string = '';

  @CreateDateColumn()
  createdAt: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();

  @OneToMany(() => ServerStatusEntity, status => status.server)
  statuses: ServerStatusEntity[] = [];
}
