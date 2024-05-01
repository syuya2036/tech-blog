import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import markdownStyles from './styles/markdown-styles.module.css';

type Props = {
  content: string;
};

export const PostBody = ({ content }: Props) => {
  return (
    <div className="post">
      <div className={markdownStyles['markdown']}></div>
      <Latex>{content}</Latex>
    </div>
  );
};
