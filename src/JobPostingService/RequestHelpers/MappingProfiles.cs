using AutoMapper;
using Contracts;
using JobPostingService.DTOs;
using JobPostingService.Entities;

namespace JobPostingService.RequestHelpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Mapping: DTO -> Entity
            CreateMap<JobPostDto, JobPost>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom<StatusResolver>()) // Custom Status resolver
                .ForMember(dest => dest.Category, opt => opt.MapFrom<CategoryResolver>()); // Custom Category resolver

            CreateMap<CreateJobPostDto, JobPost>();

            CreateMap<UpdateJobPostDto, JobPost>();

            // Mapping: Entity -> DTO
            CreateMap<JobPost, JobPostDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()));

            // Event Mappings
            CreateMap<JobPost, JobPostUpdated>()
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.Location)); // Explicit Location mapping

            CreateMap<JobPost, JobPostCreated>()
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.Location));

            CreateMap<JobPostDto, JobPostCreated>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.PaymentAmount, opt => opt.MapFrom(src => src.PaymentAmount))
                .ForMember(dest => dest.Employer, opt => opt.MapFrom(src => src.Employer))
                .ForMember(dest => dest.Deadline, opt => opt.MapFrom(src => src.Deadline))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.Location));

            // Location Mappings
            CreateMap<Entities.Location, Contracts.LocationDto>().ReverseMap();
            CreateMap<DTOs.LocationDto, Entities.Location>().ReverseMap();
            CreateMap<DTOs.LocationDto, Contracts.LocationDto>().ReverseMap();
        }
    }

    // Custom resolvers for Status and Category
    public class StatusResolver : IValueResolver<JobPostDto, JobPost, Status>
    {
        public Status Resolve(JobPostDto source, JobPost destination, Status destMember, ResolutionContext context)
        {
            return Enum.TryParse<Status>(source.Status, true, out var status) ? status : Status.Open;
        }
    }

    public class CategoryResolver : IValueResolver<JobPostDto, JobPost, Category>
    {
        public Category Resolve(JobPostDto source, JobPost destination, Category destMember, ResolutionContext context)
        {
            return Enum.TryParse<Category>(source.Category, true, out var category) ? category : Category.ArchitecturalDesign;
        }
    }
}
