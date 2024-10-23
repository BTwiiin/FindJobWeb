using System.Security.Claims;

namespace JobPostingService.UnitTests;

public class Helpers
{
    public static ClaimsPrincipal GetClaimsPrincipal()
    {
        var claims = new List<Claim> { new Claim(ClaimTypes.Name, "test") };
        var identity = new ClaimsIdentity(claims, "Testing");
        return new ClaimsPrincipal(identity);
    }

}
