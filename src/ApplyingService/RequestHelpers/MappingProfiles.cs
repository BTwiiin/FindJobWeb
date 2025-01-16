using ApplyingService.DTOs;
using ApplyingService.Models;
using AutoMapper;

namespace ApplyingService.RequestHelpers
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<JobPostRequest, JobPostRequestDto>().ReverseMap();
        }
    }
}