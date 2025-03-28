import { Body, Controller, Get, Param, Post, Put, UseGuards, Request } from '@nestjs/common';
import { ApplyingService } from './applying.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../entities/enums/role.enum';
import { ApplicationStatus } from '../entities/job-application.entity';


@Controller('apply')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplyingController {
  constructor(private readonly applyingService: ApplyingService) {}

  @Post()
  @Roles(Role.EMPLOYEE)
  async apply(@Request() req, @Body() createApplicationDto: CreateApplicationDto) {
    return this.applyingService.apply(req.user, createApplicationDto);
  }

  @Get()
  @Roles(Role.EMPLOYEE, Role.EMPLOYER)
  async findAll(@Request() req) {
    return this.applyingService.findAll(
      req.user.id,
      req.user.role === Role.EMPLOYER
    );
  }

  @Get(':id')
  @Roles(Role.EMPLOYEE, Role.EMPLOYER)
  async findOne(@Request() req, @Param('id') id: string) {
    return this.applyingService.findOne(
      id,
      req.user.id,
      req.user.role === Role.EMPLOYER
    );
  }

  @Put('/withdraw/:id')
  @Roles(Role.EMPLOYEE)
  async withdraw(@Request() req, @Param('id') id: string) {
    return this.applyingService.withdraw(id, req.user.id);
  }

  @Put(':id')
  @Roles(Role.EMPLOYER)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto
  ) {
    return this.applyingService.update(id, req.user.id, updateApplicationDto);
  }

  // @Put(':id/archive')
  // @Roles(Role.EMPLOYEE, Role.EMPLOYER)
  // async archive(@Request() req, @Param('id') id: string) {
  //   return this.applyingService.archive(id, req.user.id);
  // }
} 