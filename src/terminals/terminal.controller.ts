import{Controller,Param,Body,Post,Patch,Get,Delete } from "@nestjs/common";

import{CreateTerminalDto}from "./dto/create-terminal.dto"
import { UpdateTerminalDto} from "./dto/update-terminal.dto";
import{TerminalService}from "./terminal.service"
import { CursorPaginationQueryDto } from "./dto/PaginationQueryDto";

import { Query } from "@nestjs/common";

@Controller('terminals') 

export class TerminalController{
    constructor(private readonly terminalService:TerminalService){}

    @Post()
     create(@Body() createTerminalDto:CreateTerminalDto){
        return  this.terminalService.create(createTerminalDto)}
@Get()
  findAll(@Query()query:CursorPaginationQueryDto){
    return this.terminalService.findAll(query.cursorId,
      query.limit, 
      query.onlyActive,
      query.search

    );
  }

  @Get(":id")
  findOne(@Param('id') id:string)
    {
      return this.terminalService.findOne(id);
    }
    @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateTerminalDto: UpdateTerminalDto
  ) {
    return this.terminalService.update(id, updateTerminalDto);
  }
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.terminalService.remove(id);
  }
}