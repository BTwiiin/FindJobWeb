"use client"

import { useEffect, useState } from "react"
import { getJobPostById } from "@/app/actions/jobPostActions"
import { savedPosts, saveJobPost } from "@/app/actions/savedJobActions"
import type { JobPost, SavedPost } from "@/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Bookmark, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ApplyDialog from "../details/[id]/components/apply-dialog"

export default function SavedContent() {
  const [posts, setPosts] = useState<{ saved: SavedPost; job: JobPost }[]>([])
  const [loading, setLoading] = useState(true)
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null)
  const [jobToRemove, setJobToRemove] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSavedPosts() {
      try {
        const saved = await savedPosts()
        if (!Array.isArray(saved)) {
          setPosts([])
          return
        }

        const jobPosts = await Promise.all(
          saved.map(async (savedPost: SavedPost) => {
            const job = await getJobPostById(savedPost.jobPostId)
            return { saved: savedPost, job }
          }),
        )
        setPosts(jobPosts)
      } catch (error) {
        console.error("Error fetching saved posts:", error)
        toast.error("Failed to load saved jobs")
      } finally {
        setLoading(false)
      }
    }

    fetchSavedPosts()
  }, [])

  const handleRemove = async (jobPostId: string) => {
    try {
      await saveJobPost(jobPostId)
      setPosts((prevPosts) => prevPosts.filter(({ saved }) => saved.jobPostId !== jobPostId))
      toast.success("Job removed from saved list")
    } catch (error) {
      toast.error("Failed to remove job")
    }
    setJobToRemove(null)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-muted rounded w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>No Saved Jobs</CardTitle>
            <CardDescription>You haven&apos;t saved any jobs yet.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Save jobs you&apos;re interested in to keep track of them here.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Browse Jobs</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Saved Jobs</h1>
          <p className="text-muted-foreground">
            You have {posts.length} saved job{posts.length !== 1 && "s"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(({ saved, job }) => (
          <Card key={saved.jobPostId} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                  <CardDescription>{job.employer.username}</CardDescription>
                </div>
                <Badge variant="secondary">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(saved.savedAt).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{job.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{job.category}</Badge>
                <Badge variant="secondary">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {job.paymentAmount}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  setSelectedJob(job)
                  setShowApplyDialog(true)
                }}
              >
                Apply Now
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setJobToRemove(saved.jobPostId)
                  setShowRemoveDialog(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Apply Dialog */}
      {selectedJob && <ApplyDialog open={showApplyDialog} onOpenChange={setShowApplyDialog} jobPost={selectedJob} />}

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Saved Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this job from your saved list?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => jobToRemove && handleRemove(jobToRemove)}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

