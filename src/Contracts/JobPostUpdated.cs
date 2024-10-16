﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contracts
{
    public class JobPostUpdated
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int PaymentAmount { get; set; }
        public DateTime Deadline { get; set; }
        public string Category { get; set; }
    }
}