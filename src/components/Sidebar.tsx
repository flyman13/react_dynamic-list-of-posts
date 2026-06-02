import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Post } from '../types/Post';
import { Comment } from '../types/Comment';
import { getPostComments, deleteComment } from '../api/comments';
import { NewCommentForm } from './NewCommentForm';
import { Loader } from './Loader';

interface SidebarProps {
  post: Post | null;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ post, onClose }) => {
  const [openCommentForm, setOpenCommentForm] = useState(false);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  const [commentsState, setCommentsState] = useState<{
    items: Comment[];
    isLoading: boolean;
    error: string;
  }>({
    items: [],
    isLoading: false,
    error: '',
  });

  useEffect(() => {
    if (!post) {
      setCommentsState({ items: [], isLoading: false, error: '' });
      return;
    }

    setCommentsState({ items: [], isLoading: true, error: '' });

    getPostComments(post.id)
      .then(res => {
        setCommentsState({ items: res, isLoading: false, error: '' });
      })
      .catch(() => {
        setCommentsState({ items: [], isLoading: false, error: 'Unable to load comments' });
      });
  }, [post]);

  useEffect(() => {
    setOpenCommentForm(false);
  }, [post]);

  const handleDelete = useCallback((commentId: number) => {
    const commentToDelete = commentsState.items.find(c => c.id === commentId);
    if (!commentToDelete) return;

    setDeletingIds(prev => [...prev, commentId]);
    setCommentsState(prev => ({
      ...prev,
      items: prev.items.filter(x => x.id !== commentId),
    }));

    deleteComment(commentId)
      .catch(() => {
        setCommentsState(prev => ({
          ...prev,
          items: [...prev.items, commentToDelete].sort((a, b) => a.id - b.id),
          error: 'Failed to delete comment',
        }));
      })
      .finally(() => {
        setDeletingIds(prev => prev.filter(i => i !== commentId));
      });
  }, [commentsState.items]);

  const handleAdd = useCallback((newComment: Comment) => {
    setCommentsState(prev => ({
      ...prev,
      items: [...prev.items, newComment],
    }));
  }, []);

  if (!post) return null;

  const showNoCommentsMessage =
    !commentsState.isLoading &&
    !commentsState.error &&
    commentsState.items.length === 0;

  return (
    <div className="content" data-cy="PostDetails">
      <div className="block">
        <button
          className="delete is-pulled-right"
          aria-label="close"
          onClick={onClose}
        />
        <h2 className="title is-4" data-cy="PostTitle">#{post.id}: {post.title}</h2>
        <p data-cy="PostBody">{post.body}</p>
      </div>
      <hr />

      <div className="block">
        <h3 className="title is-5">Comments</h3>
        {commentsState.isLoading && <Loader />}
        {commentsState.error && (
          <div className="notification is-danger" data-cy="CommentsError">
            {commentsState.error}
          </div>
        )}

        {commentsState.items.length > 0 && !commentsState.isLoading && (
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
                  <a href={`mailto:${comment.email}`} data-cy="CommentAuthor">{comment.name}</a>
                </strong>
                <p data-cy="CommentBody">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}

        {showNoCommentsMessage && (
          <p className="title is-4" data-cy="NoCommentsMessage">No comments yet</p>
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
        <NewCommentForm
          selectedPost={post}
          onAddComment={handleAdd}
        />
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
