import Avatar from '@components/user/avatar/avatar'
import DynamicFieldView from '@components/generic/dynamic-field/dynamic-field-view'
import { FIELDS } from '@lib/config/config-constants'
import Link from 'next/link'

export default function (props) {
  // Link to detail if it's not a summary
  const links = !!props.summary

  const shouldAddLink = (field) => {
    return (
      links &&
      field.type !== FIELDS.IMAGE &&
      field.type !== FIELDS.FILE &&
      field.type !== FIELDS.TAGS &&
      field.type !== FIELDS.VIDEO_URL
    )
  }

  return (
    <>
      <div className={`group-summary-view ${props.className}`}>
        <div className="">
          <div className="group-top-section">

            {props.type.fields
              .filter((f) => f.name === props.type.publishing.title)
              .map((field) => {
                return (
                  <h1
                    className="content-title"
                    key={`${field.name}-${props.group.id}`}
                  >
                    {links && (
                      <Link
                        href={`/group/${props.type.slug}/${props.group.slug}`}
                      >
                        <a>{props.group[field.name]}</a>
                      </Link>
                    )}
                    {!links && props.group[field.name]}
                  </h1>
                )
              })}

            <div className="members-wrapper">
              <div className="members-title">Members</div>
              <div className="members-list">
                { props.group.members.map(member => {
                    return (
                      <div className="member-item"><Avatar width={'50px'} src={member.profile.picture?.path} /></div>
                    )
                  }) }  
              </div>
            </div>
          </div>

          {props.type.fields
            .filter((f) => !f.hidden)
            .filter((f) => f.name !== props.type.publishing.title)
            .map((field) => {
              return (
                <div key={`${field.name}-${props.group.id}`}>
                  {shouldAddLink(field) && (
                    <Link
                      href={`/group/${props.type.slug}/${props.group.slug}`}
                    >
                      <a title="Go to item detail">
                        <DynamicFieldView
                          field={field}
                          value={props.group[field.name]}
                          typeDefinition={props.type}
                        />
                      </a>
                    </Link>
                  )}
                  {!shouldAddLink(field) && (
                    <DynamicFieldView
                      field={field}
                      value={props.group[field.name]}
                      typeDefinition={props.type}
                    />
                  )}
                </div>
              )
            })}
        </div>
      </div>
      <style jsx>{`

        .group-top-section {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: var(--edge-gap);
          justify-content: space-between;
          align-items: center;
        }
        
        .content-title {
          font-size: 24px;
          line-height: 1;
          padding-right: var(--edge-gap);
        }

        @media all and (max-width: 720px) {
          .content-title {
            font-size: 21px;
            line-height: 1.25;
            padding-right: 0;
          }
        }

        a {
          text-decoration: none;
          color: var(--edge-link-color);
        }

        .members-list {
          display: flex;
        }

        .member-item {
          border-radius: 100%;
          overflow: hidden;
        }

        .member-item:not(:first-child) {
          margin-left: -25px;
          -webkit-mask:radial-gradient(circle 25px at 5px 50%,transparent 99%,#fff 100%);
                  mask:radial-gradient(circle 25px at 5px 50%,transparent 99%,#fff 100%);
        }
      `}</style>
    </>
  )
}