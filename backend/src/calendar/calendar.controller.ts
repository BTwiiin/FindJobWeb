import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UnauthorizedException } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  create(@Body() createCalendarEventDto: CreateCalendarEventDto) {
    return this.calendarService.create(createCalendarEventDto);
  }

  @Get()
  findAll(
    @User('id') userId: string | null,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('User not found');
    }

    return this.calendarService.findAll(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('job-post/:id')
  getEventsByJobPost(@Param('id') id: string) {
    return this.calendarService.getEventsByJobPost(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calendarService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateData: Partial<CreateCalendarEventDto>) {
  //   return this.calendarService.update(id, updateData);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calendarService.remove(id);
  }
} 