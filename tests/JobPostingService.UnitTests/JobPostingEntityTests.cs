namespace JobPostingService.UnitTests;
using JobPostingService.Entities;

public class JobPostingEntityTests
{
    [Fact]
    public void HasPaymentAmount_PaymentAmountGtZero_True()
    {
        var jobpost = new JobPost { Id = Guid.NewGuid(), PaymentAmount = 100 };
        Assert.True(jobpost.HasPaymentAmount());
    }

    [Fact]
    public void HasPaymentAmount_PaymentAmountGtZero_False()
    {
        var jobpost = new JobPost { Id = Guid.NewGuid(), PaymentAmount = 0 };
        Assert.False(jobpost.HasPaymentAmount());
    }
}
