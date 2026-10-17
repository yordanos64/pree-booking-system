import { ConflictException, Injectable,NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTerminalDto } from "./dto/create-terminal.dto";
import { UpdateTerminalDto } from "./dto/update-terminal.dto";
import { Prisma } from '@prisma/client';
import { paginateCursor } from "../common/utils/pagination.util";

@Injectable()
export class TerminalService{

constructor(private readonly prisma:PrismaService){}

async create(createTerminalDto:CreateTerminalDto){
    try{
        return await this.prisma.terminal.create({
            data:createTerminalDto,
        })
    }
   catch (error) {
    
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Terminal with this name already exists');
    }
    
   
    throw error;
  }

}
async findAll(cursorId?: string, limit: number = 10, onlyActive: boolean = true,search?: string,) {
    const items = await this.prisma.terminal.findMany({
      take: limit + 1,
      skip: cursorId ? 1 : 0,
      cursor: cursorId ? { id: cursorId } : undefined,
      where: {
      deletedAt: null,
      ...(onlyActive ? { isActive: true } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
      orderBy:[ { createdAt: 'asc' },
        { id: 'asc' }
      ],
    });

    
    return paginateCursor(items, limit);
  }

  
  
    async findOne(id: string) {
  const terminal = await this.prisma.terminal.findFirst({
    where: {
      id,
      deletedAt: null, 
    },
  });

 
if(!terminal){
    throw  new NotFoundException(`terminal with ${id} not found`);
}
return terminal;
}
async update(id:string , updateTerminalDto:UpdateTerminalDto){
  await this.findOne(id);
    try{
        return await this.prisma.terminal.update({
            where:{id, },
            data:updateTerminalDto
        })
    }
 
   catch (error) {
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Terminal with ID ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('A terminal with this name already exists');
        }
      }
      throw error;
    }
      

    }
async remove(id: string) {
 
  await this.findOne(id);

  try {
    return await this.prisma.terminal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false, 
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }
    throw error;
  }
}
}