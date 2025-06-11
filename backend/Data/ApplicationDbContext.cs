using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Models;
using System.Text.Json;

namespace Taqyim.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        { }
        public DbSet<User> Users { get; set; }
        public DbSet<Business> Businesses { get; set; }
        public DbSet<BusinessLocation> BusinessLocations { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<CommentReaction> CommentReactions { get; set; } 
        public DbSet<Reaction> Reactions { get; set; }
        public DbSet<Connection> Connections { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Badge> Badges { get; set; }
        public DbSet<UserBadge> UserBadges { get; set; }
        public DbSet<Media> Media { get; set; }
        public DbSet<SavedReview> SavedReviews { get; set; }
        public DbSet<Product> Products { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>()
                .HasKey(u => u.UserId);
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.Email).IsRequired();
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Type).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });
            modelBuilder.Entity<Business>(entity =>
            {
                entity.HasKey(e => e.BusinessId);

                entity.HasOne(d => d.Owner)
                    .WithMany(p => p.BusinessUsers)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                modelBuilder.Entity<Business>()
                .HasOne(b => b.VerifiedByUser)
                .WithMany()
                .HasForeignKey(b => b.VerifiedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

                // Custom ValueConverter for Category (ICollection<string> to JSON string)
                var stringListConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<
                    ICollection<string>?,
                    string>(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null), // Convert List<string> to JSON string
                    v => JsonSerializer.Deserialize<ICollection<string>>(v, (JsonSerializerOptions?)null)!); // Convert JSON string to List<string>

                modelBuilder.Entity<Business>()
                .Property(b => b.Category)
                .HasConversion(stringListConverter);

                modelBuilder.Entity<Business>()
                .HasOne(b => b.VerifiedByUser)
                .WithMany(u => u.BusinessVerifiedByUsers)
                .HasForeignKey(b => b.VerifiedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            });
            modelBuilder.Entity<BusinessLocation>(entity =>
            {
                entity.HasKey(e => e.LocationId);

                entity.Property(e => e.Latitude)
                    .HasPrecision(18, 6);

                entity.Property(e => e.Longitude)
                    .HasPrecision(18, 6);

                entity.HasOne(d => d.Business)
                    .WithMany(p => p.BusinessLocations)
                    .HasForeignKey(d => d.BusinessId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(p => p.ProductId);
                entity.Property(p => p.Name).IsRequired();


            });
            
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Business)
                .WithMany(b => b.Products)
                .HasForeignKey(p => p.BusinessId)
                .OnDelete(DeleteBehavior.SetNull);  

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Product)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Business)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasMany(r => r.Media)
                .WithOne(m => m.Review)
                .HasForeignKey(m => m.ReviewId)
                .OnDelete(DeleteBehavior.Cascade); 

            modelBuilder.Entity<Comment>(entity =>
            {
                entity.HasKey(e => e.CommentId);

                entity.HasOne(d => d.Commenter)
                    .WithMany(p => p.Comments)
                    .HasForeignKey(d => d.CommenterId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Review)
                    .WithMany(p => p.Comments)
                    .HasForeignKey(d => d.ReviewId)
                    .OnDelete(DeleteBehavior.Cascade);


                entity.HasOne(c => c.ParentComment)
                    .WithMany(c => c.Replies)
                    .HasForeignKey(c => c.ParentCommentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Reaction>(entity =>
            {
                entity.HasKey(e => e.ReactionId);

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Reactions)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Review)
                    .WithMany(p => p.Reactions)
                    .HasForeignKey(d => d.ReviewId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Tag>(entity =>
            {
                entity.HasKey(e => e.TagId);
                entity.Property(e => e.TagType).IsRequired();

                entity.HasOne(d => d.Review)
                    .WithMany(p => p.Tags)
                    .HasForeignKey(d => d.ReviewId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Connection>()
            .HasOne(c => c.Follower)
            .WithMany(u => u.ConnectionFollowings)
            .HasForeignKey(c => c.FollowerId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Connection>()
                .HasOne(c => c.Following)
                .WithMany(u => u.ConnectionFollowers)
                .HasForeignKey(c => c.FollowingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Connection>()
                .HasOne(c => c.BusinessFollower)
                .WithMany(b => b.ConnectionFollowings)
                .HasForeignKey(c => c.BusinessFollowerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Connection>()
                .HasOne(c => c.BusinessFollowing)
                .WithMany(b => b.ConnectionFollowers)
                .HasForeignKey(c => c.BusinessFollowingId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.NotificationId);

                entity.HasOne(d => d.User)
                    .WithMany(p => p.NotificationUsers)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Sender)
                    .WithMany(p => p.NotificationSenders)
                    .HasForeignKey(d => d.SenderId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
            modelBuilder.Entity<Conversation>(entity =>
            {
                entity.HasKey(e => e.ConversationId);

                entity.HasMany(c => c.Users)
                    .WithMany(u => u.Conversations);
            });
            modelBuilder.Entity<Message>(entity =>
            {
                entity.HasKey(e => e.MessageId);

                entity.HasOne(d => d.Sender)
                    .WithMany(p => p.Messages)
                    .HasForeignKey(d => d.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Conversation)
                    .WithMany(p => p.Messages)
                    .HasForeignKey(d => d.ConversationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<Badge>(entity =>
            {
                entity.HasKey(e => e.BadgeId);
                entity.Property(e => e.Name).IsRequired();
            });
            modelBuilder.Entity<UserBadge>(entity =>
            {
                entity.HasKey(e => e.UserBadgeId);
                entity.HasOne(d => d.User)
                    .WithMany(p => p.UserBadges)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(d => d.Badge)
                    .WithMany(p => p.UserBadges)
                    .HasForeignKey(d => d.BadgeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<Media>(entity =>
            {
                entity.HasKey(e => e.MediaId);
                entity.Property(e => e.FileName).IsRequired();
                entity.Property(e => e.FilePath).IsRequired();
                entity.Property(e => e.FileType).IsRequired();

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Media)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<SavedReview>(entity =>
            {
                entity.HasKey(e => e.SavedReviewId);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.SavedReviews)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Review)
                    .WithMany(r => r.SavedByUsers)
                    .HasForeignKey(e => e.ReviewId)
                    .OnDelete(DeleteBehavior.Cascade);
                    modelBuilder.Entity<SavedReview>()
                    .HasIndex(sr => new { sr.UserId, sr.ReviewId })
                    .IsUnique();
            });

        }
    }
}
