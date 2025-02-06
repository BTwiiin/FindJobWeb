using ApplyingService.DTOs;
using ApplyingService.Models;
using AutoMapper;
using Contracts;

namespace ApplyingService.RequestHelpers
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<JobPostRequest, JobPostRequestDto>().ReverseMap();
            CreateMap<JobPostRequest, JobPostRequestPlaced>().ReverseMap();
        }
    }
}