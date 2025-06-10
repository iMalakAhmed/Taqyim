using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Data;
using Taqyim.Api.DTOs;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Taqyim.Api.Services
{
    public class SearchService
    {
        private readonly ApplicationDbContext _context;

        public SearchService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedResultDTO<SearchUserDTO>> SearchUsersAsync(string query, int page, int pageSize)
        {
            if (string.IsNullOrEmpty(query)) return new PaginatedResultDTO<SearchUserDTO>();

            var queryable = _context.Users
                .Where(u => u.UserName.Contains(query) || u.Email.Contains(query));

            var totalCount = await queryable.CountAsync();

            var users = await queryable
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new SearchUserDTO
                {
                    UserId = u.UserId,
                    UserName = u.UserName,
                    Email = u.Email,
                    Type = "User",
                    ProfilePic = u.ProfilePic
                })
                .ToListAsync();

            return new PaginatedResultDTO<SearchUserDTO>
            {
                Items = users,
                TotalCount = totalCount
            };
        }

        public async Task<PaginatedResultDTO<SearchBusinessDTO>> SearchBusinessesAsync(string query, int page, int pageSize)
        {
            if (string.IsNullOrEmpty(query)) return new PaginatedResultDTO<SearchBusinessDTO>();

            var queryable = _context.Businesses
                .Where(b => b.Name.Contains(query) || b.Description.Contains(query) || (b.Category != null && b.Category.AsEnumerable().Any(c => c.Contains(query))));

            var totalCount = await queryable.CountAsync();

            var businesses = await queryable
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new
                {
                    BusinessId = b.BusinessId,
                    Name = b.Name,
                    Category = b.Category != null && b.Category.Any() ? b.Category.First() : "",
                    Description = b.Description,
                    Rating = (double?)null,
                    PriceRange = (string?)null,
                    CreatedAt = b.CreatedAt,
                    ReviewCount = b.Reviews.Count,
                    BusinessLocations = b.BusinessLocations.Select(bl => new BusinessLocationDTO
                    {
                        LocationId = bl.LocationId,
                        BusinessId = bl.BusinessId,
                        Address = bl.Address,
                        Latitude = bl.Latitude != null ? (double?)bl.Latitude : null,
                        Longitude = bl.Longitude != null ? (double?)bl.Longitude : null,
                        Label = bl.Label
                    }).ToList()
                })
                .ToListAsync();

            return new PaginatedResultDTO<SearchBusinessDTO>
            {
                Items = businesses.Select(b => new SearchBusinessDTO
                {
                    BusinessId = b.BusinessId,
                    Name = b.Name,
                    Category = b.Category,
                    Description = b.Description,
                    Rating = b.Rating,
                    PriceRange = b.PriceRange,
                    CreatedAt = b.CreatedAt,
                    ReviewCount = b.ReviewCount,
                    BusinessLocations = b.BusinessLocations
                }),
                TotalCount = totalCount
            };
        }

        public async Task<PaginatedResultDTO<SearchReviewDTO>> SearchReviewsAsync(string query, int page, int pageSize)
        {
            if (string.IsNullOrEmpty(query)) return new PaginatedResultDTO<SearchReviewDTO>();

            var queryable = _context.Reviews
                .Include(r => r.Business)
                .Include(r => r.User)
                .Where(r => r.Comment.Contains(query) || r.Business.Name.Contains(query) || r.User.UserName.Contains(query));

            var totalCount = await queryable.CountAsync();

            var reviews = await queryable
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new SearchReviewDTO
                {
                    ReviewId = r.ReviewId,
                    Comment = r.Comment,
                    Rating = r.Rating,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    BusinessName = r.Business.Name,
                    BusinessId = r.BusinessId,
                    UserName = r.User.UserName,
                    UserId = r.UserId,
                    UserProfilePic = r.User.ProfilePic,
                    CommentsCount = r.Comments.Count(),
                    ReactionsCount = r.Reactions.Count(),
                    Tags = r.Tags.Select(t => t.TagType).ToList()
                })
                .ToListAsync();

            return new PaginatedResultDTO<SearchReviewDTO>
            {
                Items = reviews,
                TotalCount = totalCount
            };
        }
    }
} 