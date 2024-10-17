using AutoMapper;
using Contracts;

namespace JobPostingService.RequestHelpers
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<Entities.JobPost, DTOs.JobPostDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id)); ;
            CreateMap<DTOs.JobPostDto, Entities.JobPost>()
                .ForMember(
                    dest => dest.Status,
                    opt => opt.MapFrom(src => Enum.Parse<Entities.Status>(src.Status))
                )
                .ForMember(
                    dest => dest.Category,
                    opt => opt.MapFrom(src => Enum.Parse<Entities.Category>(src.Category))
                );
            CreateMap<DTOs.CreateJobPostDto, Entities.JobPost>();
            CreateMap<DTOs.UpdateJobPostDto, Entities.JobPost>();
            CreateMap<DTOs.JobPostDto, JobPostCreated>();
            CreateMap<Entities.JobPost, JobPostUpdated>();
        }
    }
}
