import { useEffect, useState } from 'react';

import './App.css';

interface Job {
  id: number;
  url?: string;
  by: string;
  time: number;
  title: string;
}

function JobPosting({ url, by, time, title }: Job) {
  return (
    <div className="post" role="listitem">
      <h2 className="post__title">
        {url ? (
          <a
            className="post__title__link"
            href={url}
            target="_blank"
            rel="noopener noreferrer">
            {title}
          </a>
        ) : (
          title
        )}
      </h2>
      <p className="post__metadata">
        By {by} &middot; {new Date(time * 1000).toLocaleString()}
      </p>
    </div>
  );
}

const PAGE_SIZE = 6;

export default function App() {
  const [fetchingJobDetails, setFetchingJobDetails] = useState<boolean>(false);
  const [jobIds, setJobIds] = useState<number[] | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    fetchJobs(page);
  }, [page]);

  async function fetchJobIds(currPage: number): Promise<number[]|null> {
    let jobs = jobIds;
    if (!jobs) {
      const res = await fetch(
        'https://hacker-news.firebaseio.com/v0/jobstories.json',
      );
      jobs = await res.json();
      setJobIds(jobs);
    }

    const start = currPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return jobs?jobs.slice(start, end):null;
  }

  async function fetchJobs(currPage: number) {
    const jobIdsForPage = await fetchJobIds(currPage);

    setFetchingJobDetails(true);
    const jobsForPage = await Promise.all(
      jobIdsForPage.map((jobId) =>
        fetch(
          `https://hacker-news.firebaseio.com/v0/item/${jobId}.json`,
        ).then((res) => res.json()),
      ),
    );
    setJobs([...jobs, ...jobsForPage]);

    setFetchingJobDetails(false);
  }

  return (
    <div className="app">
      <h1 className="title">Jobs List</h1>
      {jobIds == null ? (
        <p className="loading">Loading...</p>
      ) : (
        <div>
          <div className="jobs" role="list">
            {jobs.map((job) => (
              <JobPosting key={job.id} {...job} />
            ))}
          </div>
          {jobs.length > 0 &&
            page * PAGE_SIZE + PAGE_SIZE <
              jobIds.length && (
              <button
                className="next-button"
                disabled={fetchingJobDetails}
                onClick={() => setPage(page + 1)}>
                {fetchingJobDetails
                  ? 'Loading...'
                  : 'See more jobs'}
              </button>
            )}
        </div>
      )}
    </div>
  );
}