﻿using AutoMapper;
using SearchService.Models;

namespace SearchService.RequestHelpers
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<Contracts.JobPostCreated, JobPost>();
        }
    }
}
