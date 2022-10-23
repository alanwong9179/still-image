import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';

import { DialogContent } from '@mui/material';
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

export default function NewImageDialog({open, onUpload}) {

  return (
    <Dialog fullWidth={true} maxWidth={'sm'} open={open}  TransitionComponent={Transition}>

    <DialogTitle>Hey there 👋, please select a photo first.</DialogTitle>
    <DialogContent>
    <Button
      variant="contained"
      component="label"
    >
      Upload File
      <input
        type="file"
        hidden
        onInput={(e)=>{onUpload(e)}}
      />
    </Button>
    </DialogContent>

  </Dialog>
  );
}
