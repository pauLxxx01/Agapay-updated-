import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const ConfirmDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Confirmation</DialogTitle>
      <DialogContent>
      <Typography variant="body2" color="textSecondary">
      Are you sure you want to delete this responder?
      </Typography>
    
      </DialogContent>
      <DialogActions>
        <Button size="small" onClick={onClose}>Cancel</Button>
        <Button size="small" color="success" onClick={onConfirm}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
