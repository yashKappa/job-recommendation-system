const JobResults = ({ jobs }) => {
  return (
    <div className="job-results">
      <h3>Recommended Jobs</h3>

      {jobs.map((job, i) => (
        <div key={i} className="job-card">
          <h4>{job.title}</h4>
          <p>{job.company}</p>
          <p>{job.location}</p>
          <a href={job.apply_link} target="_blank" rel="noreferrer">
            Apply
          </a>
        </div>
      ))}
    </div>
  );
};

export default JobResults;

