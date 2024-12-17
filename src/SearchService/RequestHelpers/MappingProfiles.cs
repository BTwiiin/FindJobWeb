using AutoMapper;
using SearchService.Models;

namespace SearchService.RequestHelpers
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<Contracts.JobPostCreated, JobPost>();
            CreateMap<Contracts.JobPostUpdated, JobPost>();
            CreateMap<Contracts.LocationDto, Location>();
        }
    }
}
