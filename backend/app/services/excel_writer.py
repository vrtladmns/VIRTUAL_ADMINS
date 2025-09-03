import os
import logging
from typing import Dict
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv
import filelock

# Load environment variables
load_dotenv(encoding="utf-8", override=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ExcelWriter:
    def __init__(self):
        # Use EXCEL_FILE if set, else default to ./data/onboarded_employees.xlsx
        # Get the directory where this script is located and resolve to absolute path
        script_dir = Path(__file__).resolve().parent.parent.parent
        default_excel_path = script_dir / "data" / "onboarded_employees.xlsx"
        
        self.excel_file = os.getenv("EXCEL_FILE", str(default_excel_path))
        self.excel_path = Path(self.excel_file).resolve()
        
        # Ensure data directory exists
        self.excel_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Define the exact column order as specified (14 fields + created_at)
        self.COLUMN_ORDER = [
            "employee_code",
            "employee_name",
            "gender",
            "date_of_birth",
            "date_of_joining",
            "designation",
            "ctc_at_joining",
            "aadhaar_number",
            "uan",
            "personal_email_id",
            "official_email_id",
            "contact_number",
            "emergency_contact_name",
            "emergency_contact_number",
            "created_at"
        ]
    
    def append_employee_row(self, doc: Dict) -> str:
        """
        Append employee data to Excel file with consistent column order
        
        Args:
            doc: Employee document dictionary
            
        Returns:
            str: "ok" if successful, "failed" if failed
        """
        logger.info(f"Starting Excel export for employee: {doc.get('employee_code', 'Unknown')}")
        logger.info(f"Excel file path: {self.excel_path}")
        logger.info(f"Excel file exists: {self.excel_path.exists()}")
        logger.info(f"Data directory exists: {self.excel_path.parent.exists()}")
        
        # Create lock file path for concurrent write safety
        lock_path = self.excel_path.with_suffix('.lock')
        
        try:
            # Use filelock to ensure thread-safe writes
            with filelock.FileLock(str(lock_path), timeout=30):
                # Convert dates to YYYY-MM-DD format for Excel
                excel_doc = {}
                for key, value in doc.items():
                    if key in ['date_of_birth', 'date_of_joining']:
                        # Format dates as YYYY-MM-DD
                        if hasattr(value, 'strftime'):
                            excel_doc[key] = value.strftime('%Y-%m-%d')
                        elif hasattr(value, 'isoformat'):
                            # Handle ISO string dates
                            excel_doc[key] = value.isoformat()[:10]  # Take YYYY-MM-DD part
                        else:
                            excel_doc[key] = str(value)
                    elif key == 'created_at':
                        # Format created_at as YYYY-MM-DD
                        if hasattr(value, 'strftime'):
                            excel_doc[key] = value.strftime('%Y-%m-%d')
                        elif hasattr(value, 'isoformat'):
                            excel_doc[key] = value.isoformat()[:10]
                        else:
                            excel_doc[key] = str(value)
                    elif key in ['aadhaar_number', 'uan']:
                        # Format Aadhaar and UAN as text strings to prevent scientific notation
                        excel_doc[key] = f'"{str(value)}"' if value else '""'
                    elif key == 'ctc_at_joining':
                        # Format CTC as currency in rupees
                        excel_doc[key] = float(value) if value else 0.0
                    else:
                        excel_doc[key] = value
                
                # Ensure all columns exist in the document
                for col in self.COLUMN_ORDER:
                    if col not in excel_doc:
                        excel_doc[col] = ""
                
                # Create DataFrame with exact column order
                df_new = pd.DataFrame([excel_doc])
                df_new = df_new[self.COLUMN_ORDER]
                
                # Ensure Aadhaar and UAN columns are treated as text
                if 'aadhaar_number' in df_new.columns:
                    df_new['aadhaar_number'] = df_new['aadhaar_number'].astype(str)
                if 'uan' in df_new.columns:
                    df_new['uan'] = df_new['uan'].astype(str)
                
                if self.excel_path.exists():
                    # Read existing file
                    try:
                        df_existing = pd.read_excel(self.excel_path)
                        
                        # Ensure existing file has correct columns
                        if not all(col in df_existing.columns for col in self.COLUMN_ORDER):
                            logger.warning("Existing Excel file has different columns. Recreating with correct structure.")
                            df_existing = pd.DataFrame(columns=self.COLUMN_ORDER)
                        
                        # Ensure existing Aadhaar and UAN columns are treated as text
                        if 'aadhaar_number' in df_existing.columns:
                            df_existing['aadhaar_number'] = df_existing['aadhaar_number'].astype(str)
                        if 'uan' in df_existing.columns:
                            df_existing['uan'] = df_existing['uan'].astype(str)
                        
                        # Append new row
                        df_combined = pd.concat([df_existing, df_new], ignore_index=True)
                        
                    except Exception as e:
                        logger.warning(f"Error reading existing Excel file: {str(e)}. Creating new file.")
                        df_combined = df_new
                else:
                    # Create new file
                    df_combined = df_new
                    logger.info(f"Creating new Excel file: {self.excel_path}")
                
                # Save to Excel with exact column order and text formatting
                df_combined = df_combined[self.COLUMN_ORDER]
                
                # Create Excel writer with specific formatting
                with pd.ExcelWriter(self.excel_path, engine='openpyxl') as writer:
                    df_combined.to_excel(writer, index=False, sheet_name='Employees')
                    
                    # Get the worksheet to apply text formatting
                    worksheet = writer.sheets['Employees']
                    
                    # Format Aadhaar and UAN columns as text
                    for col_num, col_name in enumerate(df_combined.columns, 1):
                        if col_name in ['aadhaar_number', 'uan']:
                            # Apply text format to entire column
                            for row_num in range(2, len(df_combined) + 2):  # Start from row 2 (skip header)
                                cell = worksheet.cell(row=row_num, column=col_num)
                                cell.number_format = '@'  # Text format
                        elif col_name == 'ctc_at_joining':
                            # Apply currency format to CTC column (Indian Rupees)
                            for row_num in range(2, len(df_combined) + 2):  # Start from row 2 (skip header)
                                cell = worksheet.cell(row=row_num, column=col_num)
                                cell.number_format = '₹#,##0.00'  # Indian Rupee format
                
                logger.info(f"Employee data appended to Excel file: {self.excel_path}")
                return "ok"
                
        except Exception as e:
            logger.error(f"Failed to append employee data to Excel: {str(e)}")
            return "failed"
        finally:
            # Clean up lock file if it exists
            if lock_path.exists():
                try:
                    lock_path.unlink()
                except:
                    pass


# Global instance
excel_writer = ExcelWriter()
