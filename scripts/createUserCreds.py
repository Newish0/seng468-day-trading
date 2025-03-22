import argparse
import os
import random

def generatePassword():
  password = ""
  length = random.randint(8, 15)
  for i in range(length):
    # Uppercase, lowercase, and numbers
    password += chr(random.choice(list(range(48, 58)) + list(range(65, 91)) + list(range(97, 123))))
  return password

def main():
  parser = argparse.ArgumentParser(description='Create user credentials')
  parser.add_argument('--numUsers', type=int, help='an integer for the number of users')
  args = parser.parse_args()
  if not args.numUsers:
    parser.error('Please provide the number of users')
    exit(1)

  filename = ""
  # This is a basic check to see if the scripts dir is the working directory
  # If so, we can use some default values, otherwise we won't for safety
  if os.path.exists("./flush_redis_unix.sh"):
    filename = f"../userCreds/UserCreds_{args.numUsers}.csv"
    print(f"The default path for this file is {filename}")
    userFilenameChoice = input(f"Type a different path or press ENTER to use the default path: ")
    if userFilenameChoice:
      filename = userFilenameChoice
  else:
    filename = input("Enter the path for the file: ")
  if not filename.endswith('.csv'):
    print("ERROR: File must be a CSV file")
    exit(1)
  if os.path.exists(filename):
    input(f"The file {filename} already exists. Press ENTER to overwrite the file or CTRL-C to exit")
  print(f"Creating user credentials for {args.numUsers} users in {filename}...")

  if filename.startswith('../userCreds/') and not os.path.exists('../userCreds/'):
    os.mkdir('../userCreds/')

  try:
    with open(filename, 'w+') as f:
      f.write("username,password,name\n")
      for i in range(args.numUsers):
        f.write(f"user{i+1},{generatePassword()},Full Name{i+1}\n")
  except Exception as e:
    print(f"ERROR: {e}")
    exit(1)

if __name__ == '__main__':
  main()