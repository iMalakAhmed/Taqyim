using Microsoft.EntityFrameworkCore;
using Taqyim.Api.Models;

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
        public DbSet<Reaction> Reactions { get; set; }
        public DbSet<Connection> Connections { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Badge> Badges { get; set; }
        public DbSet<UserBadge> UserBadges { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired();
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Type).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });
            modelBuilder.Entity<Business>(entity =>
            {
                entity.HasKey(e => e.BusinessId);
                
                entity.HasOne(d => d.User)
                    .WithMany(p => p.BusinessUsers)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.VerifiedByUser)
                    .WithMany(p => p.BusinessVerifiedByUsers)
                    .HasForeignKey(d => d.VerifiedByUserId)
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

            // Temporarily commented out all review-related configurations
            /*
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
            */
            modelBuilder.Entity<Connection>(entity =>
            {
                entity.HasKey(e => e.ConnectionId);

                entity.HasOne(d => d.Follower)
                    .WithMany(p => p.ConnectionFollowers)
                    .HasForeignKey(d => d.FollowerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Following)
                    .WithMany(p => p.ConnectionFollowings)
                    .HasForeignKey(d => d.FollowingId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
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
                entity.HasKey(e => e.Id);

                entity.HasOne(d => d.User)
                    .WithMany(p => p.UserBadges)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Badge)
                    .WithMany(p => p.UserBadges)
                    .HasForeignKey(d => d.BadgeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
