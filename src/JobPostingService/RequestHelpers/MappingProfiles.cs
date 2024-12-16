using AutoMapper;
using Contracts;

namespace JobPostingService.RequestHelpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<DTOs.JobPostDto, Entities.JobPost>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom<StatusResolver>()) // Use the StatusResolver
                .ForMember(dest => dest.Category, opt => opt.MapFrom<CategoryResolver>()); // Use the CategoryResolver

            // Other mappings
            CreateMap<Entities.JobPost, DTOs.JobPostDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()));

            CreateMap<DTOs.CreateJobPostDto, Entities.JobPost>();
            CreateMap<DTOs.UpdateJobPostDto, Entities.JobPost>()
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.Location));

            CreateMap<Entities.Location, LocationDto>().ReverseMap();
            CreateMap<Entities.JobPost, JobPostUpdated>();
            CreateMap<Entities.JobPost, JobPostCreated>();

            CreateMap<DTOs.JobPostDto, Contracts.JobPostCreated>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.PaymentAmount, opt => opt.MapFrom(src => src.PaymentAmount))
                .ForMember(dest => dest.Employer, opt => opt.MapFrom(src => src.Employer))
                .ForMember(dest => dest.Deadline, opt => opt.MapFrom(src => src.Deadline))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.Location));

            CreateMap<LocationDto, Contracts.LocationDto>().ReverseMap();
            
        }
    }


    public class StatusResolver : IValueResolver<DTOs.JobPostDto, Entities.JobPost, Entities.Status>
    {
        public Entities.Status Resolve(DTOs.JobPostDto source, Entities.JobPost destination, Entities.Status destMember, ResolutionContext context)
        {
            return Enum.TryParse<Entities.Status>(source.Status, true, out var status) ? status : Entities.Status.Open;
        }
    }

    public class CategoryResolver : IValueResolver<DTOs.JobPostDto, Entities.JobPost, Entities.Category>
    {
        public Entities.Category Resolve(DTOs.JobPostDto source, Entities.JobPost destination, Entities.Category destMember, ResolutionContext context)
        {
            return Enum.TryParse<Entities.Category>(source.Category, true, out var category) ? category : Entities.Category.Other;
        }
    }


}
