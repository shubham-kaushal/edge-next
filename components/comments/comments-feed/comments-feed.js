import { useEffect, useState } from 'react'
import API from '../../../lib/api/api-endpoints'
import fetch from '../../../lib/fetcher'
import Button from '../../generic/button/button'
import Placeholder from '../../generic/loading/loading-placeholder/loading-placeholder'
import Conversation from '../conversation/conversation'

function LoadingItems() {
  return (
    <>
      <div className="placeholders">
        <div className="p">
          <div className="a">
            <Placeholder width={'40px'} height={'40px'} borderRadius={'100%'} />
          </div>
          <div className="d">
            <div className="r">
              <Placeholder width={'100%'} height={'10px'} />
            </div>
            <div className="r">
              <Placeholder width={'100%'} height={'40px'} />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .p {
          background: var(--empz-background);
          padding: var(--empz-gap-half);
          margin-bottom: var(--empz-gap-half);
          border-radius: var(--empz-radius);
          display: flex;
        }

        .d {
          flex: 1;
          padding-left: var(--empz-gap-half);
        }
        .r {
          margin-bottom: var(--empz-gap-half);
        }
      `}</style>
    </>
  )
}

function EmptyComponent() {
  
  return <div className="empty">There are no comments</div>
}

export default function ({
  contentId = null,
  type = {},
  newComments = [],
  conversationId = '',
}) {
  const [from, setFrom] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [items, setItems] = useState([])
  const [newItems, setNewItems] = useState([])
  const [isReachingEnd, setIsReachingEnd] = useState(false)
  const itemsPerPage = 10
  const [initialLoad, setInitialLoad] = useState(false)

  const loadItems = async () => {
    const apiUrl = `${
      API.comments[type.slug]
    }/${contentId}?limit=${itemsPerPage}${from ? '&from=' + from : ''}${
      conversationId ? `&conversationId=${conversationId}` : ''
    }`

    try {
      setIsLoadingMore(true)

      const { results } = await fetch(apiUrl)

      setItems([...items, ...results])
      setIsLoadingMore(false)

      if (results.length < itemsPerPage) {
        setIsReachingEnd(true)
      } else {
        setFrom(from + itemsPerPage)
      }
    } catch (err) {
      setIsLoadingMore(false)
      setIsReachingEnd(true)
    }
  }

  useEffect(() => {
    if (items.length === 0 && !initialLoad) {
      loadItems()
      setInitialLoad(true)
    }
  }, [setItems, initialLoad, loadItems])

  useEffect(() => {
    setNewItems(newComments)
  }, [newComments])

  return (
    <>
      <div className="comment-feed-view">
        <div className={`items`}>
          {items.length === 0 && newItems.length === 0 && !isLoadingMore && (
            <EmptyComponent />
          )}

          {newItems.map((item) => {
            return (
              <div key={item.id} className={`item`}>
                <Conversation
                  comment={item}
                  type={type}
                  contentId={contentId}
                  conversationId={item.id}
                />
              </div>
            )
          })}

          {items.map((item) => {
            return (
              <div key={item.id} className={`item`}>
                <Conversation
                  comment={item}
                  type={type}
                  contentId={contentId}
                  conversationId={item.id}
                />
              </div>
            )
          })}

          {isLoadingMore && <LoadingItems />}
        </div>

        <div className="load-more">
          {isReachingEnd ? null : (
            <Button loading={isLoadingMore} onClick={loadItems}>
              Load More
            </Button>
          )}
        </div>
      </div>
      <style jsx>{`
        .comment-feed-view {
          max-width: 500px;
          margin: 0 auto;
        }

        .load-more {
          display: flex;
          justify-content: center;
        }
      `}</style>
    </>
  )
}
