import{Controller,Param,Body,Post,Patch,Get,Delete} from "@nestjs/common";

import{CreateTerminalDto}from "./dto/create-terminal.dto"
import { UpdateTerminalDto} from "./dto/update-terminal.dto";
import{TerminalService}from "./terminal.service";

@Controller('terminals') 

export class TerminalController{
    constructor(private readonly terminalService:TerminalService){}

    @Post()
     create(@Body() createTerminalDto:CreateTerminalDto){
        return  this.terminalService.create(createTerminalDto)}
@Get()
  findAll(){
    return this.terminalService.findAll()
  }

  @Get(":id")
  findOne(@Param('id') id:string)
    {
      return this.terminalService.findOne(id);
    }
}


    




