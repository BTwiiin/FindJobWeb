using System.Runtime.InteropServices;
using System.Security.Claims;

namespace JobPostingService.IntegrationTests;

public class AuthHelper
{
    public static Dictionary<string, object> GetBearerForUser(string username)
    {
        return new Dictionary<string, object>
        {
            {
                ClaimTypes.Name, username
            }
        };
    }
}