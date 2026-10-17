import{Test,TestingModule} from "@nestjs/testing"
import { TerminalService } from './terminal.service';
import { PrismaService } from "../prisma/prisma.service"; 

import { NotFoundException ,ConflictException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CreateTerminalDto } from "./dto/create-terminal.dto";

const mockPrismaService = {
    terminal:{
        create:jest.fn(),
        findMany:jest.fn(),
        findFirst:jest.fn(),
        update:jest.fn(),

    },

}
describe('TerminalService' , () => {
    let Service : TerminalService;
    let prisma :typeof mockPrismaService;
beforeEach(async () => {
    const module:TestingModule = await Test.createTestingModule({
        providers:[
        TerminalService, 
        {
            provide :PrismaService,
            useValue: mockPrismaService,
        },
        ],
    }).compile();



Service = module.get<TerminalService>(TerminalService);
prisma = module.get(PrismaService);
});
afterEach(()=>{
    jest.clearAllMocks();
});
it("shoud be defined",() =>{
    expect(Service).toBeDefined();


})
 describe('create', () =>{
    const createTerminalDto = {name:"megnagna" , location:"Addis Ababa"};
    const mockDbResponse ={
        id : 'uuid-111-222',
       name:"megenagna",
       location:'Addis Ababa',
       isActive:true,
       deletedAt:null,

       createdAt: new Date(),
       updatedAt:new Date()
    };
    it('shoud sucessfully create a terminal (happy path)' , async () =>{
        prisma.terminal.create.mockResolvedValue(mockDbResponse);
    
    const result = await Service.create(createTerminalDto);
     expect(prisma.terminal.create).toHaveBeenCalledWith({
        data:createTerminalDto
     })
     expect(result).toEqual(mockDbResponse);
 });
 it('shoude throw confictException if the terminal name already exist (unhappy path)',async() =>{
    const mockPrsimaError = new Prisma.PrismaClientKnownRequestError(
        'uniqe constraqint violation' ,
        {code: "P2002" ,clientVersion:'5.0.0'}
    );
    prisma.terminal.create.mockRejectedValue(mockPrsimaError);
    await expect(Service.create(createTerminalDto)).rejects.toThrow(ConflictException);
 })
 })
 describe('findOne',() => {
    const terminalId = 'uuid-444';
    const mockTerminal ={
        id:terminalId,
        name:'bole Airport',
        isActive:true,
        deletedAt:null,
        createdAt:new Date(),
        updatedAt:new Date(),
    };
    it('should return a terminal when it exists(happy path)',async() =>{

        prisma.terminal.findFirst.mockResolvedValue(mockTerminal);
        const result = await Service.findOne(terminalId);
          
        expect(prisma.terminal.findFirst).toHaveBeenCalledWith({
            where:{id:terminalId,deletedAt:null},

        })
        expect(result).toEqual(mockTerminal);
    });
 it('should throw NotFoundexception if terminal does not exist (unhappy path)', async () =>{
    prisma.terminal.findFirst.mockResolvedValue(null);
    await expect(Service.findOne(terminalId)).rejects.toThrow(NotFoundException);
 })
 
 })
    describe('update', () => {
        const terminalId = 'uuid-555';
        const updateTerminalDto = { location: 'Bole Medhanialem' };
        const mockUpdatedTerminal = { 
            id: terminalId, 
            name: 'Bole Terminal', 
            location: 'Bole Medhanialem', 
            isActive: true, 
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        
        it('should successfully update a terminal record (happy path)', async () => {
            
            prisma.terminal.findFirst.mockResolvedValue(mockUpdatedTerminal);
            
            prisma.terminal.update.mockResolvedValue(mockUpdatedTerminal);

    
            const result = await Service.update(terminalId, updateTerminalDto as any);

        
            expect(prisma.terminal.update).toHaveBeenCalledWith({
                where: { id: terminalId },
                data: updateTerminalDto
            });
            expect(result).toEqual(mockUpdatedTerminal);
        });

    
        it('should throw ConflictException if trying to update to an existing terminal name (unhappy path)', async () => {
            
            prisma.terminal.findFirst.mockResolvedValue(mockUpdatedTerminal);

        
            const mockPrismaConflict = new Prisma.PrismaClientKnownRequestError(
                'Unique constraint failed',
                { code: 'P2002', clientVersion: '5.0.0' }
            );
            prisma.terminal.update.mockRejectedValue(mockPrismaConflict);

            
            await expect(Service.update(terminalId, updateTerminalDto as any)).rejects.toThrow(ConflictException);
        });

       
        it('should throw NotFoundException if Prisma cannot find the record during update execution (unhappy path)', async () => {
            
            prisma.terminal.findFirst.mockResolvedValue(mockUpdatedTerminal);

            const mockPrismaNotFound = new Prisma.PrismaClientKnownRequestError(
                'Record to update not found',
                { code: 'P2025', clientVersion: '5.0.0' }
            );
            prisma.terminal.update.mockRejectedValue(mockPrismaNotFound);

          
            await expect(Service.update(terminalId, updateTerminalDto as any)).rejects.toThrow(NotFoundException);
        });
    });

      
    describe('remove', () => {
        const terminalId = 'uuid-999';
        const mockTerminal = { 
            id: terminalId, 
            name: 'Kality Terminal', 
            location: 'Kality', 
            isActive: true, 
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        it('should successfully soft-delete a terminal record (happy path)', async () => {
        
            prisma.terminal.findFirst.mockResolvedValue(mockTerminal);
       
            prisma.terminal.update.mockResolvedValue({ ...mockTerminal, deletedAt: new Date() });

            const result = await Service.remove(terminalId);

            expect(prisma.terminal.update).toHaveBeenCalledWith({
                where: { id: terminalId },
              data: { deletedAt: expect.any(Date), isActive: false } 
            });
        });

        
        it('should throw NotFoundException if terminal does not exist or is already deleted (unhappy path)', async () => {
            
            prisma.terminal.findFirst.mockResolvedValue(null);

            
            await expect(Service.remove(terminalId)).rejects.toThrow(NotFoundException);
            expect(prisma.terminal.update).not.toHaveBeenCalled();
        });
    });

})