import { Test, TestingModule } from '@nestjs/testing';
import { TerminalController } from './terminal.controller';
import { TerminalService } from './terminal.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CursorPaginationQueryDto } from "./dto/PaginationQueryDto";



const mockTerminalService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('TerminalController', () => {
  let controller: TerminalController;
  let service: typeof mockTerminalService;

  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TerminalController],
      providers: [
        {
          provide: TerminalService,
          useValue: mockTerminalService,
        },
      ],
    }).compile();

    controller = module.get<TerminalController>(TerminalController);
    service = module.get(TerminalService);
  });


  afterEach(() => {
    jest.clearAllMocks();
  });

  
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  

  describe('create', () => {
    const createTerminalDto = { name: 'Megenagna Terminal', location: 'Addis Ababa' };
    const mockCreatedTerminal = {
      id: 'uuid-777',
      name: 'Megenagna Terminal',
      location: 'Addis Ababa',
      isActive: true,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

   
    it('should call TerminalService.create and return the result', async () => {
      
      service.create.mockResolvedValue(mockCreatedTerminal);

     
      const result = await controller.create(createTerminalDto);

      expect(service.create).toHaveBeenCalledWith(createTerminalDto);
      expect(result).toEqual(mockCreatedTerminal);
    });
  });


  describe('findAll', () => {
  
    const mockQueryDto = {
      cursorId: 'uuid-111',
      limit: 10,
      onlyActive: true,
      search: 'Megenagna',
    };

    const mockPaginatedResponse = {
      data: [
        {
          id: 'uuid-222',
          name: 'Megenagna Station',
          location: 'Addis Ababa',
          isActive: true,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      meta: {
        nextCursor: null,
        hasNextPage: false,
      }
    };

   
    it('should unpack query parameters and pass them to TerminalService.findAll', async () => {
     
      service.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(mockQueryDto as any);

      expect(service.findAll).toHaveBeenCalledWith(
        mockQueryDto.cursorId,
        mockQueryDto.limit,
        mockQueryDto.onlyActive,
        mockQueryDto.search
      );
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  
  describe('findOne', () => {
    const terminalId = 'uuid-101';
    const mockTerminal = {
      id: terminalId,
      name: 'Megenagna Station',
      location: 'Addis Ababa',
      isActive: true,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

   
    it('should return a terminal when it exists (happy path)', async () => {
      
      service.findOne.mockResolvedValue(mockTerminal);

     
      const result = await controller.findOne(terminalId);

      
      expect(service.findOne).toHaveBeenCalledWith(terminalId);
      expect(result).toEqual(mockTerminal);
    });

    
    it('should pass through NotFoundException if service throws it (unhappy path)', async () => {
     
      service.findOne.mockRejectedValue(new NotFoundException(`terminal with ${terminalId} not found`));

     
      await expect(controller.findOne(terminalId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const terminalId = 'uuid-202';
    const updateTerminalDto = { location: 'Bole Medhanialem' };
    const mockUpdatedTerminal = {
      id: terminalId,
      name: 'Bole Terminal',
      location: 'Bole Medhanialem',
      isActive: true,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

   
    it('should call TerminalService.update and return the modified record (happy path)', async () => {
     
      service.update.mockResolvedValue(mockUpdatedTerminal);


      const result = await controller.update(terminalId, updateTerminalDto as any);

      
      expect(service.update).toHaveBeenCalledWith(terminalId, updateTerminalDto);
      expect(result).toEqual(mockUpdatedTerminal);
    });

 
    it('should pass through ConflictException if name already exists during update (unhappy path)', async () => {
     
      service.update.mockRejectedValue(new ConflictException('A terminal with this name already exists'));

      await expect(controller.update(terminalId, updateTerminalDto as any)).rejects.toThrow(ConflictException);
    });
  });
  
  describe('remove', () => {
    const terminalId = 'uuid-999';
    const mockSoftDeletedTerminal = {
      id: terminalId,
      name: 'Kality Terminal',
      location: 'Kality',
      isActive: false, 
      deletedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should call TerminalService.remove and return the soft-deleted record (happy path)', async () => {
    
      service.remove.mockResolvedValue(mockSoftDeletedTerminal);

      const result = await controller.remove(terminalId);

     
      expect(service.remove).toHaveBeenCalledWith(terminalId);
      expect(result).toEqual(mockSoftDeletedTerminal);
    });

    it('should pass through NotFoundException if terminal does not exist (unhappy path)', async () => {
      
      service.remove.mockRejectedValue(new NotFoundException(`Terminal with ID ${terminalId} not found`));

      await expect(controller.remove(terminalId)).rejects.toThrow(NotFoundException);
    });
  });


});

