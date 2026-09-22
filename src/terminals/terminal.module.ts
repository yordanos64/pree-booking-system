import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { TerminalController } from "./terminal.controller";
import { TerminalService } from "./terminal.service";

@Module({
    imports: [PrismaModule],
    controllers: [TerminalController],
    providers: [TerminalService],
})
export class TerminalModule{}