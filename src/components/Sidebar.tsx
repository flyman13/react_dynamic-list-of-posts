import React, { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames';
import { Post } from '../types/Post';
import { Comment } from '../types/Comment';
import { getPostComments, deleteComment } from '../api/comments';
import { NewCommentForm } from './NewCommentForm';

type SidebarProps = {
  post: Post | null;
  onClose: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ post, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  useEffect(() => {
    if (!post) {
      setComments([]);

      return;
    }

    setLoading(true);
    setError('');
    getPostComments(post.id)
      .then((res: Comment[]) => setComments(res))
      .catch(() => setError('Unable to load comments'))
      .finally(() => setLoading(false));
  }, [post]);

  const handleDelete = useCallback(
    async (commentId: number) => {
      setDeletingIds(prev => [...prev, commentId]);
      const previous = comments;

      setComments(prev => prev.filter(x => x.id !== commentId));
      try {
        await deleteComment(commentId);
      } catch {
        setComments(previous);
        setError('Failed to delete comment');
      } finally {
        setDeletingIds(prev => prev.filter(i => i !== commentId));
      }
    },
    [comments],
  );

  const handleAdd = useCallback((comment: Comment) => {
    setComments(prev => [...prev, comment]);
  }, []);

  if (!post) {
    return null;
  }

  return (
    <aside
      className={classNames('Sidebar', { 'Sidebar--open': !!post })}
      data-cy="Sidebar"
    >
      <button className="delete" aria-label="close" onClick={onClose} />
      <h2 className="title is-4">{post.title}</h2>
      <p>{post.body}</p>
      <hr />
      <h3 className="title is-5">Comments</h3>

      {loading && <div>Loading comments...</div>}
      {error && <div className="notification is-danger">{error}</div>}

      <ul>
        {comments.map(comment => (
          <li
            key={comment.id}
            className={classNames('box', {
              'is-loading': deletingIds.includes(comment.id),
            })}
          >
            <button
              className="delete is-pulled-right"
              aria-label="delete"
              onClick={() => handleDelete(comment.id)}
              disabled={deletingIds.includes(comment.id)}
            />
            <strong>{comment.name}</strong> <em>({comment.email})</em>
            <p>{comment.body}</p>
          </li>
        ))}
      </ul>

      <NewCommentForm
        selectedPost={post}
        onAddComment={handleAdd}
        setOpenCommentForm={() => {}}
      />
    </aside>
  );
};

export default Sidebar;
