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
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> GetAllProducts()
        {
            var products = await _context.Products
                .Where(p => !p.IsDeleted)
                .Select(p => new ProductDTO
                {
                    ProductId = p.ProductId,
                    Name = p.Name,
                    Description = p.Description,
                    BusinessId = p.BusinessId ??0,
                    IsDeleted = p.IsDeleted
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: /api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDTO>> GetProductById(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.IsDeleted) return NotFound();

            var dto = new ProductDTO
            {
                ProductId = product.ProductId,
                Name = product.Name,
                Description = product.Description,
                BusinessId = product.BusinessId??0,
                IsDeleted = product.IsDeleted
            };

            return Ok(dto);
        }

        // POST: /api/products
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] ProductCreateDTO dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                BusinessId = dto.BusinessId,
                IsDeleted = false
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            Console.WriteLine($"Product added to BusinessId {product.BusinessId}");
            return Ok(new { message = "Product created", product.ProductId });
        }

        // PUT: /api/products/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductUpdateDTO dto)
        {
            var product = await _context.Products
            .Include(p => p.Business)
                .ThenInclude(b => b.Owner)
            .FirstOrDefaultAsync(p => p.ProductId == id && !p.IsDeleted);

            if (product == null || product.Business == null || product.Business.Owner == null)
                return NotFound(new { message = "Product or related business not found." });
                
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isOwner = product.Business.Owner.Type == "BusinessOwner";
            var isModerator = (product.Business.Owner.Type == "Moderator"||product.Business.Owner.Type == "Moderator" || product.Business.Owner.Type == "Admin");

            if (!isOwner && !isModerator)
                return Forbid();

            product.Name = dto.Name ?? product.Name;
            product.Description = dto.Description ?? product.Description;


            await _context.SaveChangesAsync();
            return Ok(new { message = "Product updated" });
        }

        // DELETE: /api/products/{id} (Soft Delete)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> SoftDeleteProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Business)
                    .ThenInclude(p => p.Owner)
                .FirstOrDefaultAsync(p => p.ProductId == id && !p.IsDeleted);

            if (product == null || product.Business == null || product.Business.Owner == null)
                return NotFound(new { message = "Product or related business not found." });

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isOwner = product.Business.Owner.Type == "BusinessOwner";
            var isModerator = (product.Business.Owner.Type == "Moderator" || product.Business.Owner.Type == "Admin");

            if (!isOwner && !isModerator)
                return Forbid();

            product.IsDeleted = true;
            var products = await _context.Products
                .Where(p => p.BusinessId == product.BusinessId && !p.IsDeleted)
                .ToListAsync();
            foreach (var p in products)
            {
                p.IsDeleted = true;
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Product soft deleted" });
        }
    }
}
