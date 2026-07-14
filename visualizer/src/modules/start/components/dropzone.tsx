import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

let Wrapper = styled.div`
  width: 400px;
  margin: 0 auto;
  padding: 20px;
  height: 170px;
  background: #f6f6f6;
  border: 1px dashed #ddd;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export let Dropzone = ({
  extension,
  onDrop,
  placeholder
}: {
  extension: string;
  onDrop: (files: File[]) => void;
  placeholder: string;
}) => {
  let { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    accept: {
      'application/octet-stream': [extension]
    }
  });

  return (
    <Wrapper {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? <p>Drop the file here ...</p> : <p>{placeholder}</p>}
    </Wrapper>
  );
};
