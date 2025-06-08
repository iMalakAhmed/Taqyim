using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Taqyim.Api.Data;
using Taqyim.Api.DTOs;
using Taqyim.Api.Models;

namespace Taqyim.Api.Controllers
{
    [ApiController]
    [Route("api/businesses/{businessId}/products")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> GetAllProducts(int businessId)
        {
            var products = await _context.Products
                .Where(p => p.BusinessId == businessId && !p.IsDeleted)
                .Select(p => new ProductDTO
                {
                    ProductId = p.ProductId,
                    Name = p.Name,
                    Description = p.Description,
                    BusinessId = p.BusinessId ?? 0,

                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDTO>> GetProductById(int businessId, int id)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.ProductId == id && p.BusinessId == businessId && !p.IsDeleted);

            if (product == null) return NotFound();

            var dto = new ProductDTO
            {
                ProductId = product.ProductId,
                Name = product.Name,
                Description = product.Description,
                BusinessId = product.BusinessId ?? 0,
            };

            return Ok(dto);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateProduct(int businessId, [FromBody] ProductCreateDTO dto)
        {
            var business = await _context.Businesses
                .Include(b => b.Owner)
                .FirstOrDefaultAsync(b => b.BusinessId == businessId && !b.IsDeleted);

            if (business?.Owner == null)
                return NotFound(new { message = "Product or related business not found." });

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isOwner = business.Owner.Type == "BusinessOwner";
            var isModerator = (business.Owner.Type == "Moderator" || business.Owner.Type == "Admin");
            if (!isOwner && !isModerator)
                return Forbid();

            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                BusinessId = businessId,
                IsDeleted = false
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Product created", product.ProductId });
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProduct(int businessId, int id, [FromBody] ProductUpdateDTO dto)
        {
            var product = await _context.Products
                .Include(p => p.Business)
                    .ThenInclude(b => b.Owner)
                .FirstOrDefaultAsync(p => p.ProductId == id && p.BusinessId == businessId && !p.IsDeleted);

            if (product == null || product.Business?.Owner == null)
                return NotFound(new { message = "Product or related business not found." });

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isOwner = product.Business.Owner.Type == "BusinessOwner";
            var isModerator = (product.Business.Owner.Type == "Moderator" || product.Business.Owner.Type == "Admin");
            if (!isOwner && !isModerator)
                return Forbid();

            product.Name = dto.Name ?? product.Name;
            product.Description = dto.Description ?? product.Description;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Product updated" });
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> SoftDeleteProduct(int businessId, int id)
        {
            var product = await _context.Products
                .Include(p => p.Business)
                    .ThenInclude(b => b.Owner)
                .FirstOrDefaultAsync(p => p.ProductId == id && p.BusinessId == businessId && !p.IsDeleted);

            if (product == null || product.Business?.Owner == null)
                return NotFound(new { message = "Product or related business not found." });

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isOwner = product.Business.Owner.Type == "BusinessOwner";
            var isModerator = (product.Business.Owner.Type == "Moderator" || product.Business.Owner.Type == "Admin");

            if (!isOwner && !isModerator)
                return Forbid();

            product.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product soft deleted" });
        }
    }
}
