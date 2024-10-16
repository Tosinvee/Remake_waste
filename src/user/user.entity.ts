import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 98,
        nullable: false,
        unique: true
    })
    firstName: string;

    @Column({
        type: 'varchar',
        length: 98,
        nullable: false

    })
    lastName: string;

    @Column({
        type: 'varchar',
        length: 98,
        nullable: true,
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 98,
        nullable: false,
        unique: true
    })
    password: string;

    @Column({ default: false })
    emailVerified: boolean;

    @Column({ nullable: true })
    verificationCode: string

    @CreateDateColumn()
    createdAt: Date;
}