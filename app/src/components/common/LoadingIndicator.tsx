import CircularProgress from "@mui/material/CircularProgress";

function LoadingIndicator({title}: {title?: string}) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
      {title && <p style={{ marginLeft: "10px" }}>{title}</p>}
    </div>
  );

}

export default LoadingIndicator;