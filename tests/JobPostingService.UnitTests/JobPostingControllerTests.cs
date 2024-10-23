using JobPostingService.Repository;
using JobPostingService.Controllers;
using Moq;
using MassTransit;
using AutoMapper;
using AutoFixture;
using JobPostingService.RequestHelpers;
using JobPostingService.DTOs;
using Microsoft.AspNetCore.Mvc;
using JobPostingService.Entities;
using Microsoft.AspNetCore.Http;

namespace JobPostingService.UnitTests
{
    public class JobPostControllerTests
    {
        private readonly Mock<IJobPostRepository> _jobPostRepository;
        private readonly Mock<IPublishEndpoint> _publishEndpoint;
        private readonly Fixture _fixture;
        private readonly JobPostController _controller;
        private readonly IMapper _mapper;

        public JobPostControllerTests()
        {
            _fixture = new Fixture();
            _jobPostRepository = new Mock<IJobPostRepository>();

            var mockMapper = new MapperConfiguration(cfg => 
            {
                cfg.AddMaps(typeof(MappingProfiles).Assembly);
            }).CreateMapper().ConfigurationProvider;
            _mapper = new Mapper(mockMapper);

            _publishEndpoint = new Mock<IPublishEndpoint>();

            _controller = new JobPostController(_jobPostRepository.Object, _mapper, _publishEndpoint.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = Helpers.GetClaimsPrincipal()
                    }
                }
            };
        }

        [Fact]
        public async Task GetJobPosts_WithNoParams_Returns5JobPosts()
        {
            // Arrange
            var jobPosts = _fixture.CreateMany<JobPostDto>(5).ToList();
            _jobPostRepository.Setup(repo => repo.GetAllAsync(null)).ReturnsAsync(jobPosts);

            // Act
            var result = await _controller.GetJobPosts(null);

            // Assert
            Assert.Equal(5, result.Value.Count);
            Assert.IsType<ActionResult<List<JobPostDto>>>(result);
            
        }

        [Fact]
        public async Task GetJobPostById_WithValidId_ReturnsJobPost()
        {
            // Arrange
            var jobPost = _fixture.Create<JobPostDto>();
            _jobPostRepository.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync(jobPost);

            // Act
            var result = await _controller.GetJobPostById(Guid.NewGuid());

            // Assert
            Assert.Equal(jobPost, result.Value);
            Assert.IsType<ActionResult<JobPostDto>>(result);
        }

        [Fact]
        public async Task GetJobPostById_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            _jobPostRepository.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((JobPostDto)null);

            // Act
            var result = await _controller.GetJobPostById(Guid.NewGuid());

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreateJobPost_WithValidCreateJobPostDto_ReturnsCreatedAtAction()
        {
            // Arrange
            // Fixture creates a random CreateJobPostDto.Category string, that does not map to the Category enum
            var createJobPostDto = _fixture.Build<CreateJobPostDto>()  
                               .With(dto => dto.Category, Category.Marketing.ToString())
                               .Create(); 

            _jobPostRepository.Setup(repo => repo.AddJobPost(It.IsAny<JobPost>()));
            _jobPostRepository.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _controller.CreateJobPost(createJobPostDto);
            var createdResult = result.Result as CreatedAtActionResult;

            // Assert
            Assert.NotNull(createdResult);
            Assert.Equal("GetJobPostById", createdResult.ActionName);
            Assert.IsType<JobPostDto>(createdResult.Value);
        }

        [Fact]
        public async Task UpdateJobPost_WithValidUpdateJobPostDto_ReturnsOkResponse()
        {
            // Arrange
            var jobPost = _fixture.Build<JobPost>().Create();
            jobPost.Employer = "test";
            var updateDto = _fixture.Build<UpdateJobPostDto>()
                            .With(dto => dto.Category, Category.IT.ToString())
                            .Create(); 
            _jobPostRepository.Setup(repo => repo.GetEntityByIdAsync(It.IsAny<Guid>())).ReturnsAsync(jobPost);
            _jobPostRepository.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateJobPost(jobPost.Id, updateDto);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task UpdateJobPost_WithInvalidUser_Returns403Forbid()
        {
            // Arrange
            var jobPost = _fixture.Build<JobPost>().Create();
            jobPost.Employer = "not-test";
            var updateDto = _fixture.Build<UpdateJobPostDto>()
                            .With(dto => dto.Category, Category.IT.ToString())
                            .Create(); 
            _jobPostRepository.Setup(repo => repo.GetEntityByIdAsync(It.IsAny<Guid>())).ReturnsAsync(jobPost);
            _jobPostRepository.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _controller.UpdateJobPost(jobPost.Id, updateDto);

            // Assert
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task UpdateJobPost_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            _jobPostRepository.Setup(repo => repo.GetEntityByIdAsync(It.IsAny<Guid>())).ReturnsAsync((JobPost)null);

            // Act
            var result = await _controller.UpdateJobPost(Guid.NewGuid(), _fixture.Create<UpdateJobPostDto>());

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteJobPost_WithValidId_ReturnsOkResponse()
        {
            // Arrange
            var jobPost = _fixture.Build<JobPost>().Create();
            jobPost.Employer = "test";
            _jobPostRepository.Setup(repo => repo.GetEntityByIdAsync(It.IsAny<Guid>())).ReturnsAsync(jobPost);
            _jobPostRepository.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteJobPost(jobPost.Id);

            // Assert
            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public async Task DeleteJobPost_WithInvalidUser_Returns403Forbid()
        {
            // Arrange
            var jobPost = _fixture.Build<JobPost>().Create();
            jobPost.Employer = "not-test";
            _jobPostRepository.Setup(repo => repo.GetEntityByIdAsync(It.IsAny<Guid>())).ReturnsAsync(jobPost);
            _jobPostRepository.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteJobPost(jobPost.Id);

            // Assert
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task DeleteJobPost_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            _jobPostRepository.Setup(repo => repo.GetEntityByIdAsync(It.IsAny<Guid>())).ReturnsAsync((JobPost)null);

            // Act
            var result = await _controller.DeleteJobPost(Guid.NewGuid());

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}