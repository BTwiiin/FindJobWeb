using System.Security.Claims;
using IdentityModel;
using IdentityService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace IdentityService.Pages.Account.Register;

[SecurityHeaders]
[AllowAnonymous]
public class Index : PageModel
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public Index(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        SignInManager<ApplicationUser> signInManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _signInManager = signInManager;
    }

    [BindProperty]
    public RegisterViewModel Input { get; set; }

    [BindProperty]
    public bool RegisterSuccess { get; set; }

    public IActionResult OnGet(string returnUrl = "")
    {
        Input = new RegisterViewModel
        {
            ReturnUrl = returnUrl ?? string.Empty
        };

        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        // Clear the model state errors for TaxNumber if Employee is selected
        if (Input.SelectedRole == "Employee" && ModelState.ContainsKey("Input.TaxNumber"))
        {
            ModelState.Remove("Input.TaxNumber");
        }
        
        // Clear the model state errors for ReturnUrl since it's optional
        if (ModelState.ContainsKey("Input.ReturnUrl"))
        {
            ModelState.Remove("Input.ReturnUrl");
        }

        if (ModelState.IsValid)
        {
            // Validate that TaxNumber is provided for Employer role
            if (Input.SelectedRole == "Employer" && string.IsNullOrWhiteSpace(Input.TaxNumber))
            {
                ModelState.AddModelError("Input.TaxNumber", "Tax Number is required for Employer accounts");
                return Page();
            }

            var user = new ApplicationUser
            {
                UserName = Input.Username,
                Email = Input.Email,
                EmailConfirmed = true
            };
            
            // Set TaxNumber property on the user if provided
            if (!string.IsNullOrWhiteSpace(Input.TaxNumber))
            {
                user.TaxNumber = Input.TaxNumber;
            }

            var result = await _userManager.CreateAsync(user, Input.Password);

            if (result.Succeeded)
            {
                // Ensure roles exist
                var roles = new[] { "Admin", "Employee", "Employer" };
                foreach (var role in roles)
                {
                    if (!await _roleManager.RoleExistsAsync(role))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(role));
                    }
                }

                // Add user to selected role
                await _userManager.AddToRoleAsync(user, Input.SelectedRole);

                // Add standard claims
                await _userManager.AddClaimsAsync(user, new Claim[]
                {
                    new Claim(JwtClaimTypes.Name, Input.Username),
                    new Claim(JwtClaimTypes.Email, Input.Email),
                    new Claim(JwtClaimTypes.Role, Input.SelectedRole)
                });

                // Add TaxNumber claim for Employer
                if (Input.SelectedRole == "Employer" && !string.IsNullOrWhiteSpace(Input.TaxNumber))
                {
                    await _userManager.AddClaimAsync(user, new Claim("tax_number", Input.TaxNumber));
                }

                await _signInManager.SignInAsync(user, false);
                return RedirectToPage("/Account/Login/Index");
            }

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
        }

        return Page();
    }
}
