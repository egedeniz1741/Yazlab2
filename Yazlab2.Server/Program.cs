using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Yazlab2.Data;
using Yazlab2.Interfaces;
using Yazlab2.Server.Interfaces;
using Yazlab2.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Veritabaný Baðlantýsý
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// 2. Servisler
builder.Services.AddMemoryCache();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddHttpClient<ITmdbService, TmdbService>();
builder.Services.AddHttpClient<IBookService, GoogleBookService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// 3. CORS (Önemli: React'in baðlanmasýna izin ver)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// 4. JWT Auth
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value!)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 5. HTTP Hattýný Zorla (Sadece 5120 portu)
// Bu satýr launchSettings.json karmaþasýný devre dýþý býrakýr.
app.Urls.Add("http://localhost:5120");

app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 6. Sýralama Çok Önemli!
app.UseCors("AllowAll"); // Önce Ýzin
// app.UseHttpsRedirection(); //BUNU KAPATTIK (Socket Hang Up sebebi)

app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles(); 

app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();