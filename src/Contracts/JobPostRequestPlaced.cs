namespace Contracts
{
    public class JobPostRequestPlaced
    {
        public string Id { get; set; } // Id of a JobPostRequest
        public string JobPostId { get; set; } 
        public string Employee { get; set; } // Employee who placed the request
        public DateTime RequestTime { get; set; }
        public string Status { get; set; } // Status of the request
        public string Message { get; set; } // Message from the employee
    }
}
