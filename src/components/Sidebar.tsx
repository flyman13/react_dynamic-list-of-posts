import PropTypes from 'prop-types';
// 1. Якщо classNames підсвічується сірим і не потрібен, лінтер просить ВИДАЛИТИ цей імпорт:
// import classNames from 'classnames';

import { Post } from '../types/Post';
import { NewCommentForm } from './NewCommentForm';

interface SidebarProps {
  post: Post | null;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ post, onClose }) => {
  // Твоя логіка стейтів залишається без змін...

  if (!post) {
    return null;
  }

  return (
    <div className="content" data-cy="PostDetails">
      <div className="block">
        {/* 2. ПЕРЕВІР ЦЕЙ РЯДОК: кнопка повинна мати onClick={onClose} */}
        <button
          className="delete is-pulled-right"
          aria-label="close"
          onClick={onClose}
        />
        <h2 className="title is-4" data-cy="PostTitle">
          #{post.id}: {post.title}
        </h2>
        <p data-cy="PostBody">{post.body}</p>
      </div>
      <hr />

      <div className="block">
        <h3 className="title is-5">Comments</h3>
        {commentsState.isLoading && (
          <div data-cy="Loader">Loading comments...</div>
        )}
        {commentsState.error && (
          <div className="notification is-danger" data-cy="CommentsError">
            {commentsState.error}
          </div>
        )}

        {commentsState.items.length > 0 && (
          <ul>
            {commentsState.items.map(comment => (
              <li key={comment.id} data-cy="Comment" className="box">
                <button
                  className="delete is-pulled-right"
                  aria-label="delete"
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingIds.includes(comment.id)}
                  data-cy="CommentDelete"
                />
                <strong data-cy="CommentAuthor">
                  <a href={`mailto:${comment.email}`} data-cy="CommentAuthor">
                    {comment.name}
                  </a>
                </strong>
                <p data-cy="CommentBody">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}

        {showNoCommentsMessage && (
          <p className="title is-4" data-cy="NoCommentsMessage">
            No comments yet
          </p>
        )}

        {!openCommentForm && !commentsState.isLoading && (
          <button
            data-cy="WriteCommentButton"
            type="button"
            className="button is-link"
            onClick={() => setOpenCommentForm(true)}
          >
            Write a comment
          </button>
        )}
      </div>

      {openCommentForm && (
        <NewCommentForm selectedPost={post} onAddComment={handleAdd} />
      )}
    </div>
  );
};

Sidebar.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    userId: PropTypes.number.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};
