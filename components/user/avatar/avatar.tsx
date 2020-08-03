const defaultSrc = '/static/demo-images/default-avatar.jpg'

export default function ({
  src = defaultSrc,
  title = 'Avatar',
  status = '',
  width = '100px',
  className = '',
  loading = false
}) {

  return (
    <>
      <div
        className={`avatar ${className} ${
          status ? 'has-status' : ''
        } ${status}`}
      >
        {!loading && (
          <img title={title} src={src}></img>
        )}
        {loading && (
          <div className="empty-avatar">
            <img src="/static/demo-images/loading-avatar.gif" />
          </div>
        )}
      </div>
      <style jsx>{`
        img {
          border-radius: 15%;
          overflow: hidden;
          width: 100%;
        }

        .empty-avatar {
          width: 100%;
          height: 100%;
          border: var(--light-border);
          display: block;
          border-radius: 8px;
        }

        .avatar {
          border-radius: 15%;
          display: inline-block;
          height: ${width};
          max-height: 80px;
          max-width: 80px;
          vertical-align: middle;
          width: ${width};
          position: relative;
        }

        @media all and (max-width: 720px) {
          .avatar {
            max-height: 64px;
            max-width: 64px;
          }
        }

        .avatar img {
          height: 100%;
          object-fit: cover;
          width: 100%;
        }

        .avatar.has-status:after {
          border: 2px solid var(--edge-background);
          border-radius: 50%;
          box-sizing: content-box;
          content: '';
          height: 8px;
          position: absolute;
          display: block;
          top: 0;
          right: 0;
          transform: translate(1px, -1px);
          width: 8px;
        }

        .avatar.has-status.available:after {
          background-color: var(--edge-success);
        }
      `}</style>
    </>
  )
}