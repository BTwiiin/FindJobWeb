using System.ComponentModel.DataAnnotations;

namespace IdentityService.Pages.Account.Register;

public class RegisterViewModel
{
    [Required]
    public string Email { get; set; }

    [Required]
    public string Username { get; set; }

    [Required]
    public string Password { get; set; }

    [Required]
    [Compare("Password")]
    public string ConfirmPassword { get; set; }
    
    [Required]
    [Display(Name = "Account Type")]
    public string SelectedRole { get; set; } = "Employee";
    
    [Display(Name = "Tax Number (Required for Employers)")]
    public string TaxNumber { get; set; }

    public bool IsEmployer => SelectedRole == "Employer";

    public string ReturnUrl { get; set; } = string.Empty;
    public string Button { get; set; }
}
