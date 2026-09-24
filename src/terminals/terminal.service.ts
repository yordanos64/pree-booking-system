import { ConflictException, Injectable,NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTerminalDto } from "./dto/create-terminal.dto";
import { UpdateTerminalDto } from "./dto/update-terminal.dto";

@Injectable()
export class TerminalService{

constructor(private readonly prisma:PrismaService){}

async create(createTerminalDto:CreateTerminalDto){
    try{
        return await this.prisma.terminal.create({
            data:createTerminalDto,
        })
    }
    catch(error:any){
    if(error.code==='P2002'){
        throw new ConflictException('terminal with this name already exist')

    }
    throw error;
}


}


  async findAll() {
    return await  this.prisma. terminal.findMany()
  }

  async findOne(id:string){
    const terminal =  await this.prisma.terminal.findUnique({where:{id}})
  
if(!terminal){
    throw  new NotFoundException(`terminal with ${id} not found`);
}
return terminal;
}
}