using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Data;
using Taqyim.Api.DTOs;
using Taqyim.Api.Models;
using Taqyim.Api.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Taqyim.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly SearchService _searchService;

        public SearchController(SearchService searchService)
        {
            _searchService = searchService;
        }

        // GET /api/search/users
        [HttpGet("users")]
        public async Task<ActionResult<PaginatedResultDTO<SearchUserDTO>>> SearchUsers([FromQuery] string? query, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (string.IsNullOrEmpty(query))
                return BadRequest("Search query is required");

            var results = await _searchService.SearchUsersAsync(query, page, pageSize);
            return Ok(results);
        }

        // GET /api/search/businesses
        [HttpGet("businesses")]
        public async Task<ActionResult<PaginatedResultDTO<SearchBusinessDTO>>> SearchBusinesses([FromQuery] string? query, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (string.IsNullOrEmpty(query))
                return BadRequest("Search query is required");

            var results = await _searchService.SearchBusinessesAsync(query, page, pageSize);
            return Ok(results);
        }

        // GET /api/search/reviews
        [HttpGet("reviews")]
        public async Task<ActionResult<PaginatedResultDTO<SearchReviewDTO>>> SearchReviews([FromQuery] string? query, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (string.IsNullOrEmpty(query))
                return BadRequest("Search query is required");

            var results = await _searchService.SearchReviewsAsync(query, page, pageSize);
            return Ok(results);
        }

        // GET /api/search
        [HttpGet]
        public async Task<IActionResult> SearchAll([FromQuery] string? query)
        {
            if (string.IsNullOrEmpty(query))
                return BadRequest("Search query is required");

            var users = await _searchService.SearchUsersAsync(query, 1, int.MaxValue); // Fetch all users for now
            var businesses = await _searchService.SearchBusinessesAsync(query, 1, int.MaxValue); // Fetch all businesses for now
            var reviews = await _searchService.SearchReviewsAsync(query, 1, int.MaxValue); // Fetch all reviews for now

            return Ok(new
            {
                Users = users.Items,
                Businesses = businesses.Items,
                Reviews = reviews.Items
            });
        }
    }
} 