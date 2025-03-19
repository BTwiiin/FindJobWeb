using Duende.IdentityServer.Models;
using Microsoft.Extensions.Configuration;

namespace IdentityService;

public static class Config
{
    
    public static IEnumerable<IdentityResource> IdentityResources =>
        new IdentityResource[]
        {
            new IdentityResources.OpenId(),
            new IdentityResources.Profile(),
            new IdentityResources.Email(),
            new IdentityResource
            {
                Name = "roles",
                DisplayName = "User Roles",
                Description = "Your user roles",
                UserClaims = new[] { "role" }
            },
            new IdentityResource
            {
                Name = "tax_info",
                DisplayName = "Tax Information",
                Description = "Your tax information",
                UserClaims = new[] { "tax_number" }
            }
        };

    public static IEnumerable<ApiScope> ApiScopes =>
        new ApiScope[]
        {
            new ApiScope("jobApp", "Job app full access"),
        };

    // ONLY FOR TESTING PURPOSES USING POSTMAN
    // This is not recommended for production
    public static IEnumerable<Client> Clients =>
        new Client[]
        {
            new Client
            {
                ClientId = "postman",
                ClientName = "Postman",
                AllowedScopes = { "openid", "profile", "jobApp", "roles", "tax_info", "email" },
                RedirectUris = { "https://www.postman.com/" },
                ClientSecrets = new[] { new Secret("NotASecret".Sha256()) },
                AllowedGrantTypes = GrantTypes.ResourceOwnerPassword
            },
            new Client
            {
                ClientId = "nextApp",
                ClientName = "nextApp",
                ClientSecrets = { new Secret("NotASecret".Sha256())},
                AllowedGrantTypes = GrantTypes.CodeAndClientCredentials,
                RequirePkce = false,
                RedirectUris = {
                    "http://localhost:3000/api/auth/callback/id-server",
                    "http://0.0.0.0:3000/api/auth/callback/id-server",
                    "http://192.168.0.15:3000/api/auth/callback/id-server" // Your local IP from ipconfig
                },
                AllowOfflineAccess = true,
                AllowedScopes = { "openid", "profile", "jobApp", "roles", "tax_info", "email" },
                AccessTokenLifetime = 3600*24*30, // Only for development purposes
                AlwaysIncludeUserClaimsInIdToken = true,
            }
        };
}
